import React, { useState, useRef, useEffect } from 'react';

const App = () => {
  const canvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const contextRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const CANVAS_SIZE = 280;
  const SCALED_SIZE = 28;

  // ----- Инициализация холста (чёрный фон, белая кисть) -----
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    contextRef.current = ctx;
  };

  useEffect(() => {
    initCanvas();
  }, []);

  // ----- Очистка холста -----
  const clearCanvas = () => {
    const ctx = contextRef.current;
    if (!ctx) return;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // Сброс стилей (хотя они уже установлены, но на всякий случай)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setPrediction(null);
    setError(null);
  };

  // ----- Обработчики рисования (мышь) -----
  const startDrawing = (e) => {
    e.preventDefault();
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = contextRef.current;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(false);
    // Не закрываем путь, чтобы можно было продолжать рисование с нового места
  };

  // ----- Обработчики рисования (touch) -----
  const getTouchPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const startTouch = (e) => {
    e.preventDefault();
    const { x, y } = getTouchPos(e);
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawTouch = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getTouchPos(e);
    const ctx = contextRef.current;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopTouch = (e) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  // ----- Масштабирование до 28×28 и получение Blob -----
  const resizeAndGetBlob = () => {
    return new Promise((resolve) => {
      const sourceCanvas = canvasRef.current;
      const hiddenCanvas = hiddenCanvasRef.current;
      const hiddenCtx = hiddenCanvas.getContext('2d');

      hiddenCanvas.width = SCALED_SIZE;
      hiddenCanvas.height = SCALED_SIZE;
      hiddenCtx.drawImage(sourceCanvas, 0, 0, SCALED_SIZE, SCALED_SIZE);

      hiddenCanvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  };

  // ----- Отправка на API -----
  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const blob = await resizeAndGetBlob();
      const formData = new FormData();
      formData.append('file', blob, 'digit.png');

      const response = await fetch('http://localhost:8000/upload_picture', {
        method: 'POST',
        body: formData,
        // Не ставим Content-Type вручную – браузер установит multipart/form-data с границей
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const data = await response.json();
      if (data.prediction === undefined) {
        throw new Error('Ответ не содержит prediction');
      }
      setPrediction(data.prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Нарисуйте цифру (0‑9)</h1>
      <div>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{
            border: '2px solid #333',
            cursor: 'crosshair',
            touchAction: 'none',
            backgroundColor: '#000000',
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startTouch}
          onTouchMove={drawTouch}
          onTouchEnd={stopTouch}
          onTouchCancel={stopTouch}
        />
      </div>

      {/* Скрытый холст для уменьшения */}
      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />

      <div style={{ marginTop: '1rem' }}>
        <button onClick={clearCanvas} style={{ marginRight: '1rem' }}>
          Очистить
        </button>
        <button onClick={handlePredict} disabled={loading}>
          {loading ? 'Распознавание...' : 'Распознать'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}

      {prediction !== null && (
        <div style={{ marginTop: '1.5rem' }}>
          <h2>Предсказание: {prediction}</h2>
        </div>
      )}
    </div>
  );
};

export default App;
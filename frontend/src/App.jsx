import { useState, useEffect } from 'react';

function App() {
  // здесь будем хранить ответ от бэка. Сначала пусто.
  const [health, setHealth] = useState('загрузка...');

  // useEffect запускается один раз, когда страница загрузилась
  useEffect(() => {
    fetch('http://localhost:3000/api/health')   // стучимся на бэк
      .then((res) => res.json())                 // разбираем JSON-ответ
      .then((data) => setHealth(data.status))    // кладём status ("ok") в переменную
      .catch(() => setHealth('ошибка связи'));   // если бэк недоступен
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Chess Project</h1>
      <p>Состояние бэкенда: <strong>{health}</strong></p>
    </div>
  );
}

export default App;
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const WeightTracking = ({ currentWeight, goalWeight }) => {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [goalAchieved, setGoalAchieved] = useState(false);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchWeightRecords();
  }, [period]);

  const fetchWeightRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/weight-records?period=${period}`, {
        withCredentials: true
      });
      setRecords(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при получении записей о весе:', err);
      setError('Не удалось загрузить записи о весе');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight) {
      setError('Пожалуйста, введите значение веса');
      return;
    }

    try {
      setAdding(true);
      setError('');
      setSuccess('');
      setGoalAchieved(false);

      const response = await axios.post('http://localhost:8080/weight-records', {
        weight: parseFloat(weight),
        date: date
      }, {
        withCredentials: true
      });

      setSuccess('Вес успешно записан!');
      setWeight('');
      fetchWeightRecords();

      if (response.data.goal_achieved) {
        setGoalAchieved(true);
      }
    } catch (err) {
      console.error('Ошибка при добавлении записи о весе:', err);
      setError('Не удалось добавить запись о весе: ' + (err.response?.data?.error || 'Неизвестная ошибка'));
    } finally {
      setAdding(false);
    }
  };

  const chartData = records.map(record => ({
    date: record.date,
    weight: record.weight
  }));

  if (loading) {
    return (
      <Card className="mt-4">
        <Card.Body className="text-center p-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <Card.Body>
        <Card.Title className="mb-4">Отслеживание веса</Card.Title>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        {goalAchieved && (
          <Alert variant="success" className="mb-4">
            <h4>🎉 Поздравляем! 🎉</h4>
            <p>Вы достигли своего целевого веса! Это потрясающее достижение!</p>
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>Текущий вес (кг)</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Введите ваш вес на сегодня"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Дата</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </Form.Group>
          
          <Button type="submit" variant="primary" disabled={adding}>
            {adding ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Сохранение...</span>
              </>
            ) : 'Сохранить запись'}
          </Button>
        </Form>
        
        <div className="d-flex justify-content-end mb-3">
          <Form.Select 
            style={{ width: 'auto' }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="month">За месяц</option>
            <option value="year">За год</option>
            <option value="all">За все время</option>
          </Form.Select>
        </div>
        
        {records.length > 0 ? (
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  domain={['auto', 'auto']} 
                  label={{ value: 'Вес (кг)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip formatter={(value) => [`${value} кг`, 'Вес']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="Вес (кг)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Alert variant="info">
            Записей о весе пока нет. Начните вести дневник веса, чтобы видеть прогресс!
          </Alert>
        )}
        
        <div className="mt-4">
          <p>Текущий вес: <strong>{currentWeight || 'Не указан'} кг</strong></p>
          <p>Целевой вес: <strong>{goalWeight || 'Не указан'} кг</strong></p>
          
          {currentWeight && goalWeight && (
            <p>
              До цели: <strong>{Math.abs(currentWeight - goalWeight).toFixed(1)} кг</strong>
              {currentWeight > goalWeight ? ' (нужно сбросить)' : ' (нужно набрать)'}
            </p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default WeightTracking;
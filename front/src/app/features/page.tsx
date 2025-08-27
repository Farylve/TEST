'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function FeaturesPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const router = useRouter();

  const features = [
    {
      title: 'Мониторинг сервера',
      icon: '📊',
      description: 'Отслеживание состояния backend сервера в реальном времени',
      details: [
        'Проверка доступности API endpoints',
        'Мониторинг времени отклика',
        'Визуальные индикаторы статуса',
        'Автоматическое обновление данных'
      ],
      color: 'blue'
    },
    {
      title: 'Управление задачами',
      icon: '✅',
      description: 'CRUD операции с задачами через PostgreSQL',
      details: [
        'Создание новых задач',
        'Отметка выполненных задач',
        'Удаление задач',
        'Сохранение в базе данных'
      ],
      color: 'green'
    },
    {
      title: 'API тестирование',
      icon: '🔧',
      description: 'Интерактивное тестирование REST API endpoints',
      details: [
        'Health check endpoint',
        'Server info endpoint',
        'Test data endpoint',
        'JSON response preview'
      ],
      color: 'purple'
    },
    {
      title: 'Роутинг Next.js',
      icon: '🛣️',
      description: 'Демонстрация клиентского роутинга',
      details: [
        'Навигация между страницами',
        'Активные состояния ссылок',
        'Responsive дизайн',
        'SEO оптимизация'
      ],
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Функциональность проекта
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Изучите ключевые возможности нашего full-stack приложения
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Feature Cards */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`card cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? 'ring-2 ring-blue-500 shadow-xl' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg border-2 ${getColorClasses(feature.color)}`}>
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Details */}
            <div className="card">
              <div className="text-center mb-6">
                <div className={`inline-flex p-4 rounded-xl border-2 ${getColorClasses(features[activeFeature].color)}`}>
                  <span className="text-4xl">{features[activeFeature].icon}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                  {features[activeFeature].title}
                </h2>
                <p className="text-gray-600">
                  {features[activeFeature].description}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Основные возможности:
                </h3>
                {features[activeFeature].details.map((detail, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-700">{detail}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>Функция активна и готова к использованию</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Demo Section */}
          <div className="mt-12 card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🎮 Интерактивная демонстрация
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-3">🏠</div>
                <h3 className="font-semibold text-gray-900 mb-2">Главная страница</h3>
                <p className="text-sm text-gray-600 mb-4">
                  API тестирование и управление задачами
                </p>
                <button 
                  onClick={() => router.push('/')}
                  className="btn-primary text-sm"
                >
                  Перейти
                </button>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-semibold text-gray-900 mb-2">О проекте</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Подробная информация об архитектуре
                </p>
                <button 
                  onClick={() => router.push('/about')}
                  className="btn-primary text-sm"
                >
                  Изучить
                </button>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-3">📧</div>
                <h3 className="font-semibold text-gray-900 mb-2">Контакты</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Информация для связи с разработчиком
                </p>
                <button 
                  onClick={() => router.push('/contact')}
                  className="btn-primary text-sm"
                >
                  Связаться
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

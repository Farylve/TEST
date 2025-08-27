'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Форма отправлена! (демо режим)');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Свяжитесь с нами
            </h1>
            <p className="text-xl text-gray-600">
              Есть вопросы о проекте? Мы будем рады помочь!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="card">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                📝 Отправить сообщение
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Имя
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ваше имя"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Сообщение
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Расскажите о вашем вопросе или предложении..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3 text-lg"
                >
                  Отправить сообщение
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  📞 Контактная информация
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <span className="text-2xl">👨‍💻</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Разработчик</h3>
                      <p className="text-gray-600">Ivan Lysenkov</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    <span className="text-2xl">📧</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">lysenkov.orel@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                    <span className="text-2xl">🐙</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">GitHub</h3>
                      <p className="text-gray-600">github.com/Farylve</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg">
                    <span className="text-2xl">🌐</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Сайт</h3>
                      <p className="text-gray-600">farylve.online</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  🚀 О проекте
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Статус проекта</h3>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-gray-600">Активная разработка</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Технологии</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Next.js</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Node.js</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">PostgreSQL</span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">Docker</span>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Время ответа</h3>
                    <p className="text-gray-600 text-sm">
                      Обычно отвечаем в течение 24 часов
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              ❓ Часто задаваемые вопросы
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Как запустить проект локально?
                </h3>
                <p className="text-gray-600 text-sm">
                  Клонируйте репозиторий и выполните docker-compose up для запуска всех сервисов.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Какие API endpoints доступны?
                </h3>
                <p className="text-gray-600 text-sm">
                  /api/health, /api/info, /api/tasks для CRUD операций с задачами.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Можно ли использовать код?
                </h3>
                <p className="text-gray-600 text-sm">
                  Да, проект с открытым исходным кодом. Ссылка на GitHub выше.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Планируются ли обновления?
                </h3>
                <p className="text-gray-600 text-sm">
                  Да, проект активно развивается с добавлением новых функций.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

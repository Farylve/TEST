import Navigation from '@/components/Navigation';

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="card">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                О проекте Portfolio
              </h1>
              <p className="text-xl text-gray-600">
                Современное full-stack приложение с микросервисной архитектурой
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    🎯 Цель проекта
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Демонстрация современных технологий веб-разработки и создание
                    масштабируемой архитектуры для portfolio приложений.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    🏗️ Архитектура
                  </h2>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Микросервисная архитектура</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Контейнеризация с Docker</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span>Reverse proxy с Nginx</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span>CI/CD с GitHub Actions</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    🛠️ Технологии
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Next.js 14</li>
                        <li>• React 18</li>
                        <li>• TypeScript</li>
                        <li>• Tailwind CSS</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Node.js</li>
                        <li>• Express.js</li>
                        <li>• PostgreSQL</li>
                        <li>• Docker</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    📈 Возможности
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600">⚡</span>
                      <span className="text-gray-700">Мониторинг сервера в реальном времени</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <span className="text-green-600">📝</span>
                      <span className="text-gray-700">Управление задачами с PostgreSQL</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-600">🔄</span>
                      <span className="text-gray-700">API тестирование и мониторинг</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                🚀 Статус разработки
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">✅</div>
                  <div className="text-sm text-gray-600 mt-1">Backend API</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">✅</div>
                  <div className="text-sm text-gray-600 mt-1">Database</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">🔄</div>
                  <div className="text-sm text-gray-600 mt-1">UI/UX</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

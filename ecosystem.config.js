module.exports = {
  apps: [{
    name: 'nextjs',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/nextjs',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8888
    },
    error_file: '/var/log/pm2/nextjs-error.log',
    out_file: '/var/log/pm2/nextjs-out.log',
    log_file: '/var/log/pm2/nextjs-combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
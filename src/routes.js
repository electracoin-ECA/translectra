import WebHomeController from './controllers/web/HomeController'

const routes = [
  /* ========================================
    Website
  */
  {
    path: '/',
    method: 'get',
    controller: WebHomeController,
  },
]

export default routes

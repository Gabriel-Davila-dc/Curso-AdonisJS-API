/* |-------------------------------------------------------------------------- | Routes file |-------------------------------------------------------------------------- | | The routes file is used for defining the HTTP routes. | */
import router from '@adonisjs/core/services/router'
import { MomentsController } from '../app/controllers/moments_controller.js'
import { CommentsController } from '../app/controllers/comments_controller.js'
import app from '@adonisjs/core/services/app'

router
  .group(() => {
    router.get('/', async () => {
      return { hello: 'world' }
    })

    router.resource('/moments', MomentsController).apiOnly()

    router.post('/moments/:momentId/comment', [CommentsController, 'store'])

    router.get('/uploads/:file', [MomentsController, 'findImage'])
  })
  .prefix('/api')

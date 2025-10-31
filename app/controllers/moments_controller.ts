import { v4 as uuidv4 } from 'uuid'
import { HttpContext } from '@adonisjs/core/http'
import Moment from '../models/moment.js'
import { join } from 'path'
import app from '@adonisjs/core/services/app'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync } from 'fs'

// Corrige __dirname no ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..')

// Cria pasta tmp/uploads se não existir
const uploadPath = join(__dirname, '../../tmp/uploads')
if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true })
}

export class MomentsController {
  private validateOptions = {
    types: ['image'],
    size: '2mb',
  }

  public async store({ request, response }: HttpContext) {
    const body = request.body()
    const image = request.file('image', this.validateOptions)

    if (image) {
      const imageName = `${uuidv4()}.${image.extname}`

      await image.move(uploadPath, {
        name: imageName,
      })

      body.image = imageName
    }

    const moment = await Moment.create(body)
    response.status(201)

    return {
      message: 'Momento criado com sucesso!',
      data: moment,
    }
  }

  public async index() {
    const moments = await Moment.query().preload('comments')

    return {
      data: moments,
    }
  }

  public async show({ params, response }: HttpContext) {
    // Verifica se o ID foi passado
    if (!params.id) {
      return response.status(400).send({ message: 'ID é obrigatório' })
    }

    // Tenta buscar o momento
    const moment = await Moment.find(params.id)

    await moment?.load('comments')

    if (!moment) {
      return response.status(404).send({ message: 'Momento não encontrado' })
    }

    return { data: moment }
  }

  public async destroy({ params, response }: HttpContext) {
    // Verifica se o ID foi passado
    if (!params.id) {
      return response.status(400).send({ message: 'ID é obrigatório' })
    }

    // Tenta buscar o momento
    const moment = await Moment.find(params.id)

    await moment?.delete()

    if (!moment) {
      return response.status(404).send({ message: 'Momento não encontrado' })
    }

    return {
      message: 'Momento excluidocom sucesso',
      data: moment,
    }
  }

  public async update({ params, request, response }: HttpContext) {
    const body = request.body()

    const moment = await Moment.find(params.id)

    // 🛑 Verifica se o momento existe
    if (!moment) {
      return response.status(404).send({ message: 'Momento não encontrado' })
    }

    moment.title = body.title
    moment.description = body.description

    if (moment.image != body.image || !moment.image) {
      const image = request.file('image', this.validateOptions)

      if (image) {
        const imageName = `${uuidv4()}.${image.extname}`
        await image.move(uploadPath, { name: imageName })
        moment.image = imageName
      }
    }

    await moment.save()

    return {
      message: 'Momento atualizado com sucesso!',
      data: moment,
    }
  }

  public async findImage({ params, response }: HttpContext) {
    const filePath = app.makePath(`tmp/uploads/${params.file}`)

    try {
      return response.download(filePath)
    } catch {
      return response.status(404).send('Arquivo não encontrado')
    }
  }
}

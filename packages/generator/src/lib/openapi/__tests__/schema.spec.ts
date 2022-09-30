import { readFileSync } from 'fs'
import { generate, generateBaseData, generateRoutesDefinition } from '../lib/schema'
import { OpenAPI3 } from '../lib/types'

const schemaTxt = readFileSync(__dirname + '/cards.json', 'utf-8')

describe('schema', () => {
  let schema: OpenAPI3
  beforeAll(() => {
    schema = JSON.parse(schemaTxt)
  })
  describe('generateBaseData', () => {
    describe('types', () => {
      it('finds all types', () => {
        const generated = generateBaseData({ schema })
    
        expect(generated.types).toEqual({
          Card: expect.any(String),
          CardSettings: expect.any(String),
          CardList: expect.any(String),
          Documented: expect.any(String),
        })
      })
      it('generates all properties', () => {
        const generated = generateBaseData({ schema })

        expect(generated.types.Card).toEqual(
`export interface Card {
  id: string
  ownerId: string
  nameOnCard: string
  settings?: CardSettings
}`
        )
      })
      it('generates deep properties', () => {
        const generated = generateBaseData({ schema })

        expect(generated.types.CardSettings).toEqual(
`export interface CardSettings {
  cardId: string
  frozen: {
    value: boolean
    editableByChild: boolean
  }
}`
        )
      })
      it('generates array properties', () => {
        const generated = generateBaseData({ schema })

        expect(generated.types.CardList).toEqual(
`export interface CardList {
  cards: Card[]
}`
        )
      })
      it('generates docs', () => {
        const generated = generateBaseData({ schema })

        expect(generated.types.Documented).toEqual(
`/**
 * A documented type
 */
export interface Documented {
  /**
   * The id of the documented type
   */
  id: string
  /**
   * Settings
   */
  settings?: CardSettings
}`
        )
      })
    })
    describe('paths', () => {
      it('rewrites urls', () => {
        const generated = generateBaseData({ schema })
    
        expect(generated.paths[0].url).toEqual('/:cardId')
      })
      it('sets the correct method', () => {
        const generated = generateBaseData({ schema })
        const getCard = generated.paths[0]
    
        expect(getCard.method).toEqual('get')
      })
      it('finds all methods', () => {
        const generated = generateBaseData({ schema })
        const deleteCard = generated.paths[1]
    
        expect(deleteCard.url).toEqual('/:cardId')
        expect(deleteCard.method).toEqual('delete')
      })
      it('generates parameters', () => {
        const generated = generateBaseData({ schema })
        const getCard = generated.paths[0]
    
        expect(getCard.requestParams).toEqual('{cardId: string}')
      })
      it('generates query', () => {
        const generated = generateBaseData({ schema })
        const getCard = generated.paths[0]
    
        expect(getCard.requestQuery).toEqual('{cardNickname: boolean}')
      })
      it('generates body', () => {
        const generated = generateBaseData({ schema })
        const putCardSettings = generated.paths[2]
    
        expect(putCardSettings.requestBody).toEqual('CardSettings')
      })
      it('generates result', () => {
        const generated = generateBaseData({ schema })
        const getCard = generated.paths[0]
    
        expect(getCard.resultBody).toEqual('Card')
      })
    })
  })
  describe('generateRoutesDefinition', () => {
    it('generates a RoutesDefinition', () => {
      const generated = generateBaseData({ schema })
      const map = generateRoutesDefinition(generated.paths)

      expect(map).toEqual({
        get: {
          '/:cardId': 'TypedRoute<{cardId: string}, Card, never, {cardNickname: boolean}>',
        },
        put: {
          '/:cardId/settings': 'TypedRoute<{cardId: string}, never, CardSettings, never>',
        },
        delete: {
          '/:cardId': 'TypedRoute<{cardId: string}, Card, never, {cardNickname: boolean}>',
        },
      })
    })
  })
  describe('generate', () => {
    it('generates a correct document', () => {
      const generated = generate({ schema })
      const expected = (
`/**
 * This file was auto-generated.
 * Do not make direct changes to the file.
 */

/* tslint:disable */
/* eslint-disable */

export interface Card {
  id: string
  ownerId: string
  nameOnCard: string
  settings?: CardSettings
}

export interface CardSettings {
  cardId: string
  frozen: {
    value: boolean
    editableByChild: boolean
  }
}

export interface CardList {
  cards: Card[]
}

/**
 * A documented type
 */
export interface Documented {
  /**
   * The id of the documented type
   */
  id: string
  /**
   * Settings
   */
  settings?: CardSettings
}

type Server = 'http://localhost:3000/cards' | 'https://core.run.app/cards'

type TypedRoute<RequestParams, ResultBody, RequestBody, RequestQuery> = {
  requestParams: RequestParams
  resultBody: ResultBody
  requestBody: RequestBody
  requestQuery: RequestQuery
}

export type RoutesDefinition = {
  server: Server,
  get: {
    '/:cardId': TypedRoute<{cardId: string}, Card, never, {cardNickname: boolean}>,
  },
  delete: {
    '/:cardId': TypedRoute<{cardId: string}, Card, never, {cardNickname: boolean}>,
  },
  put: {
    '/:cardId/settings': TypedRoute<{cardId: string}, never, CardSettings, never>,
  },
}
`)
      expect(generated).toEqual(expected)
    })
  })
})
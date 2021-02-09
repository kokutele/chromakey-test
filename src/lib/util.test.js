import { 
  add,
  getSquare
} from './util'

it('returns 3', () => {
  expect( add(1, 2) ).toBe(3)
})

describe('getSquare', () => {
  test('scenario #1', () => {
    expect( getSquare( [[5,1],[1,2],[2,8],[6,7]] ))
      .toStrictEqual( {ox: 1, oy: 2, theta: 0.17, w: 4.12, h: 6.08} )
  })

  test('scenario #2', () => {
    expect( getSquare( [[2,1],[1,7],[5,8],[6,2]] ))
      .toStrictEqual( {ox: 2, oy: 1, theta: -0.24, w: 4.12, h: 6.08} )
  })
})
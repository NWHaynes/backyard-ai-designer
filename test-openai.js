import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: 'test'
})

console.log('Available image methods:')
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(openai.images)))

console.log('\nTrying to access methods directly:')
console.log('generate exists:', typeof openai.images.generate)
console.log('edit exists:', typeof openai.images.edit)
console.log('edits exists:', typeof openai.images.edits)
console.log('variations exists:', typeof openai.images.variations)

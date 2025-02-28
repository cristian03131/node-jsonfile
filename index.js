// Intenta importar el módulo graceful-fs. Si falla, usa el módulo fs estándar.
let _fs
try {
  _fs = require('graceful-fs')
} catch (_) {
  _fs = require('fs')
}

// Importa el módulo universalify para compatibilidad con callbacks y promesas.
const universalify = require('universalify')
const { stringify, stripBom } = require('./utils')

// Función asíncrona para leer un archivo JSON.
async function _readFile (file, options = {}) {
  // Si options es una cadena, conviértela en un objeto con la codificación.
  if (typeof options === 'string') {
    options = { encoding: options }
  }

  // Selecciona el módulo fs según las opciones o usa el módulo por defecto.
  const fs = options.fs || _fs


  // Determina si se debe lanzar un error si falla la lectura.
  const shouldThrow = 'throws' in options ? options.throws : true

  // Lee el archivo usando universalify para compatibilidad con promesas.
  let data = await universalify.fromCallback(fs.readFile)(file, options)

  // Elimina el BOM del contenido.
  data = stripBom(data)

  let obj
  try {
    // Parsea el contenido como JSON.
    obj = JSON.parse(data, options ? options.reviver : null)
  } catch (err) {
    // Si se debe lanzar un error, agrega el nombre del archivo al mensaje y lanza.
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`
      throw err
    } else {
      // De lo contrario, devuelve null.
      return null
    }
  }

  return obj
}

// Convierte _readFile en una función compatible con promesas
const readFile = universalify.fromPromise(_readFile)

//Funcion sincrona para leer un archivo JSON
function readFileSync (file, options = {}) {
  // Si options es una cadena, conviértela en un objeto con la codificación.
  if (typeof options === 'string') {
    options = { encoding: options }
  }

  const fs = options.fs || _fs

  const shouldThrow = 'throws' in options ? options.throws : true

  try {
    // Lee el archivo síncronamente.
    let content = fs.readFileSync(file, options)
    content = stripBom(content)
    return JSON.parse(content, options.reviver)
  } catch (err) {
     // Si se debe lanzar un error, agrega el nombre del archivo al mensaje y lanza.
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`
      throw err
    } else {
      // De lo contrario, devuelve null.
      return null
    }
  }
}

// Función asíncrona para escribir un archivo JSON.
async function _writeFile (file, obj, options = {}) {
  const fs = options.fs || _fs

  // Convierte el objeto en una cadena JSON.
  const str = stringify(obj, options)

  // Escribe el archivo usando universalify para compatibilidad con promesas.
  await universalify.fromCallback(fs.writeFile)(file, str, options)
}

// Convierte _writeFile en una función compatible con promesas.
const writeFile = universalify.fromPromise(_writeFile)

// Función síncrona para escribir un archivo JSON.
function writeFileSync (file, obj, options = {}) {

  // Selecciona el módulo fs según las opciones o usa el módulo por defecto.
  const fs = options.fs || _fs

  const str = stringify(obj, options)
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

// Exporta las funciones para leer y escribir archivos JSON.
const jsonfile = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync
}

module.exports = jsonfile

/**
 * Script para testar a validação e carregamento do QuestionRegistry
 */

const fs = require('fs')
const path = require('path')

// Carregar validator
const { validateQuestion } = require('./validator_standalone.js')

// Vamos ver quantas perguntas passam no validateQuestion!

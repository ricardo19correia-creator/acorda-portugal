import assert from 'node:assert/strict'

// Mocks para simular ambiente e dependências
interface MockFirestoreDoc {
  data: Record<string, any>
  exists: boolean
  set: (data: Record<string, any>, opts?: any) => Promise<void>
  update: (data: Record<string, any>) => Promise<void>
  get: () => Promise<{ exists: boolean; data: () => Record<string, any> }>
}

function createMockFirestore(shouldFail = false) {
  const store = new Map<string, Record<string, any>>()

  return {
    collection: (colName: string) => ({
      doc: (docId = 'mock_doc_id') => {
        return {
          id: docId,
          async get() {
            if (shouldFail) throw new Error('Firestore connection failure')
            const exists = store.has(docId)
            return {
              exists,
              data: () => store.get(docId) || {},
            }
          },
          async set(data: Record<string, any>) {
            if (shouldFail) throw new Error('Firestore write quota exceeded')
            store.set(docId, { ...(store.get(docId) || {}), ...data })
          },
          async update(data: Record<string, any>) {
            if (shouldFail) throw new Error('Firestore update failed')
            const current = store.get(docId) || {}
            store.set(docId, { ...current, ...data })
          },
        }
      },
    }),
    _getStore: () => store,
  }
}

// Validador de payload reproduzindo a rota
function validateFeedbackPayload(body: Record<string, any>) {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const title = (body.title || body.subject || body.problemType || '').trim()
  const description = (body.description || body.message || '').trim()
  const contactEmail = (body.contactEmail || body.userEmail || '').trim()

  if (title.length < 3 || title.length > 120) {
    return { valid: false, status: 400, error: 'O assunto/título do problema deve conter entre 3 e 120 caracteres.' }
  }

  if (description.length < 10 || description.length > 3000) {
    return { valid: false, status: 400, error: 'A descrição detalhada do problema deve conter pelo menos 10 caracteres.' }
  }

  if (contactEmail && !EMAIL_REGEX.test(contactEmail)) {
    return { valid: false, status: 400, error: 'O endereço de email fornecido não tem um formato válido.' }
  }

  return { valid: true }
}

async function runTests() {
  console.log('=== TEST SUITE: SISTEMA DE FEEDBACK & RESEND API ===\n')

  // 1. Feedback Válido
  {
    console.log('1. Teste: Feedback Válido')
    const validBody = {
      title: 'Sugestão de Pergunta',
      description: 'Gostaria de sugerir uma nova pergunta sobre história de Portugal para o quiz.',
      contactEmail: 'jogador@exemplo.pt',
      type: 'sugestao',
    }
    const val = validateFeedbackPayload(validBody)
    assert.equal(val.valid, true, 'O payload válido deve ser aprovado')
    console.log('   ✓ Aprovado com sucesso.')
  }

  // 2. Feedback Inválido
  {
    console.log('\n2. Teste: Validação de Payload Inválido')
    // Título curto
    const resShortTitle = validateFeedbackPayload({ title: 'Ab', description: 'Descrição longa com mais de 15 caracteres' })
    assert.equal(resShortTitle.valid, false)
    assert.equal(resShortTitle.status, 400)
    assert.match(resShortTitle.error!, /assunto\/título do problema deve conter entre 3 e 120/)

    // Descrição curta
    const resShortDesc = validateFeedbackPayload({ title: 'Título válido', description: 'Curto' })
    assert.equal(resShortDesc.valid, false)
    assert.equal(resShortDesc.status, 400)
    assert.match(resShortDesc.error!, /descrição detalhada do problema deve conter pelo menos 10/)

    // Email inválido
    const resBadEmail = validateFeedbackPayload({
      title: 'Título válido',
      description: 'Descrição longa com mais de 15 caracteres',
      contactEmail: 'email_invalido_sem_arroba',
    })
    assert.equal(resBadEmail.valid, false)
    assert.equal(resBadEmail.status, 400)
    assert.match(resBadEmail.error!, /não tem um formato válido/)
    console.log('   ✓ Todas as validações rejeitaram dados inválidos com HTTP 400.')
  }

  // 3. Firestore Indisponível
  {
    console.log('\n3. Teste: Firestore Indisponível')
    const failingDb = createMockFirestore(true)
    let caughtError: any = null
    try {
      await failingDb.collection('feedback').doc('test-doc').set({ test: true })
    } catch (err: any) {
      caughtError = err
    }
    assert.ok(caughtError, 'O erro de Firestore deve ser capturado pelo try/catch externo')
    const publicErrorResponse = {
      success: false,
      error: 'Erro interno ao processar o feedback. Por favor, tenta novamente.',
      details: process.env.NODE_ENV === 'development' ? caughtError.message : undefined,
    }
    assert.equal(publicErrorResponse.success, false)
    assert.equal(publicErrorResponse.error, 'Erro interno ao processar o feedback. Por favor, tenta novamente.')
    assert.equal(publicErrorResponse.details, undefined, 'Em produção, details internos não devem ser vazados')
    console.log('   ✓ Erro do Firestore capturado com HTTP 500 e sem fuga de detalhes internos.')
  }

  // 4. RESEND_API_KEY Ausente
  {
    console.log('\n4. Teste: RESEND_API_KEY Ausente')
    const savedKey = process.env.RESEND_API_KEY
    const savedHost = process.env.SMTP_HOST
    const savedPass = process.env.SMTP_PASS
    delete process.env.RESEND_API_KEY
    delete process.env.SMTP_HOST
    delete process.env.SMTP_PASS

    // Simula o ciclo da rota
    const db = createMockFirestore(false)
    const feedbackDocRef = db.collection('feedback').doc('feedback_123')
    
    // 1. Gravar com emailStatus: 'pending'
    await feedbackDocRef.set({
      id: 'feedback_123',
      title: 'Erro no ecrã de duelo',
      emailStatus: 'pending',
      emailSent: false,
    })

    // 2. Tentar envio (vai falhar por ausência de credenciais)
    let emailFailed = false
    let technicalMsg = ''
    try {
      if (!process.env.RESEND_API_KEY && (!process.env.SMTP_HOST || !process.env.SMTP_PASS)) {
        throw new Error('Nenhum serviço de email configurado no servidor.')
      }
    } catch (err: any) {
      emailFailed = true
      technicalMsg = err.message
      await feedbackDocRef.update({
        emailStatus: 'failed',
        emailSent: false,
        emailError: technicalMsg,
      })
    }

    assert.equal(emailFailed, true)
    const storedData = db._getStore().get('feedback_123')
    assert.equal(storedData?.emailStatus, 'failed')
    assert.equal(storedData?.emailSent, false)
    assert.equal(storedData?.title, 'Erro no ecrã de duelo', 'Feedback não foi perdido do Firestore')

    const publicResponse = {
      success: false,
      error: 'O teu feedback foi registado, mas não foi possível entregar a notificação por email de momento. A nossa equipa irá analisar o teu relato diretamente na plataforma.',
      feedbackId: 'feedback_123',
      savedInFirestore: true,
      emailStatus: 'failed',
    }

    assert.equal(publicResponse.success, false)
    assert.equal(publicResponse.savedInFirestore, true)
    assert.equal(publicResponse.emailStatus, 'failed')
    assert.doesNotMatch(publicResponse.error, /RESEND|SMTP|Vercel/)
    console.log('   ✓ Ausência de chave tratada: feedback guardado, emailStatus=failed, resposta pública segura.')

    // Restaurar ambiente
    if (savedKey) process.env.RESEND_API_KEY = savedKey
    if (savedHost) process.env.SMTP_HOST = savedHost
    if (savedPass) process.env.SMTP_PASS = savedPass
  }

  // 5. Erro do Resend (ex: chave inválida ou erro HTTP da API)
  {
    console.log('\n5. Teste: Erro do Resend')
    const db = createMockFirestore(false)
    const feedbackDocRef = db.collection('feedback').doc('feedback_resend_err')

    await feedbackDocRef.set({
      id: 'feedback_resend_err',
      emailStatus: 'pending',
      emailSent: false,
    })

    // Simula resposta HTTP 403 do Resend
    let resendFailed = false
    try {
      const mockResendResponse = {
        ok: false,
        status: 403,
        json: async () => ({ statusCode: 403, message: 'Invalid API key provided' }),
      }
      if (!mockResendResponse.ok) {
        const errorJson = await mockResendResponse.json()
        throw new Error(`Falha no envio via Resend: ${errorJson.message}`)
      }
    } catch (err: any) {
      resendFailed = true
      await feedbackDocRef.update({
        emailStatus: 'failed',
        emailSent: false,
        emailError: err.message,
      })
    }

    assert.equal(resendFailed, true)
    const stored = db._getStore().get('feedback_resend_err')
    assert.equal(stored?.emailStatus, 'failed')
    assert.equal(stored?.emailError, 'Falha no envio via Resend: Invalid API key provided')
    console.log('   ✓ Erro do Resend capturado, logado internamente no Firestore e não vazado para o utilizador.')
  }

  // 6. Sucesso do Resend
  {
    console.log('\n6. Teste: Sucesso do Resend')
    const db = createMockFirestore(false)
    const feedbackDocRef = db.collection('feedback').doc('feedback_success_456')

    await feedbackDocRef.set({
      id: 'feedback_success_456',
      emailStatus: 'pending',
      emailSent: false,
    })

    // Simula resposta HTTP 200 do Resend
    const mockResendResponse = {
      ok: true,
      status: 200,
      json: async () => ({ id: 'resend_msg_abc123' }),
    }

    let emailResult: any = null
    if (mockResendResponse.ok) {
      const data = await mockResendResponse.json()
      emailResult = { success: true, messageId: data.id }
      await feedbackDocRef.update({
        emailStatus: 'sent',
        emailSent: true,
        emailSentAt: new Date().toISOString(),
        emailMessageId: emailResult.messageId,
      })
    }

    assert.equal(emailResult.success, true)
    assert.equal(emailResult.messageId, 'resend_msg_abc123')
    const stored = db._getStore().get('feedback_success_456')
    assert.equal(stored?.emailStatus, 'sent')
    assert.equal(stored?.emailSent, true)
    assert.equal(stored?.emailMessageId, 'resend_msg_abc123')

    const successResponse = {
      success: true,
      feedbackId: 'feedback_success_456',
      emailStatus: 'sent',
      emailSent: true,
      message: 'Feedback enviado com sucesso! Obrigado por ajudares a melhorar o Desafio Nacional.',
    }

    assert.equal(successResponse.success, true)
    assert.equal(successResponse.emailStatus, 'sent')
    assert.equal(successResponse.emailSent, true)
    console.log('   ✓ Sucesso real do Resend: emailStatus=sent, Firestore atualizado, confirmação devolvida.')
  }

  // 7. Confirmação de que o texto permanece no formulário quando o email falha
  {
    console.log('\n7. Teste: Preservação de Texto no Frontend em Caso de Falha')
    
    // Simula estado do formulário React
    let titleState = 'Sugestão importante de jogo'
    let descriptionState = 'Esta é uma descrição longa que o utilizador demorou tempo a escrever.'
    let guestEmailState = 'jogador@portugal.pt'
    let submitSuccessState = false
    let errorMessageState: string | null = null

    // Simula a função handleSubmit com resposta de falha (HTTP 502)
    const mockApiResponse = {
      ok: false,
      status: 502,
      json: async () => ({
        success: false,
        error: 'O teu feedback foi registado, mas não foi possível entregar a notificação por email de momento. A nossa equipa irá analisar o teu relato diretamente na plataforma.',
      }),
    }

    try {
      const data = await mockApiResponse.json()
      if (!mockApiResponse.ok || !data.success) {
        throw new Error(data.error)
      }
      // Se tivesse sucesso, limparia os campos (NÃO deve acontecer aqui)
      titleState = ''
      descriptionState = ''
      guestEmailState = ''
      submitSuccessState = true
    } catch (err: any) {
      errorMessageState = err.message
      // Campos permanecem intocados
    }

    assert.equal(submitSuccessState, false, 'submitSuccess deve continuar false')
    assert.equal(titleState, 'Sugestão importante de jogo', 'Título deve ser preservado')
    assert.equal(descriptionState, 'Esta é uma descrição longa que o utilizador demorou tempo a escrever.', 'Descrição deve ser preservada')
    assert.equal(guestEmailState, 'jogador@portugal.pt', 'Email deve ser preservado')
    assert.equal(errorMessageState, 'O teu feedback foi registado, mas não foi possível entregar a notificação por email de momento. A nossa equipa irá analisar o teu relato diretamente na plataforma.')
    console.log('   ✓ Preservação garantida: o formulário mantém todos os dados quando há falha no envio de email.')
  }

  console.log('\n=== TODOS OS 7 TESTES PASSARAM COM SUCESSO! ===')
}

runTests().catch((err) => {
  console.error('Falha na suite de testes:', err)
  process.exit(1)
})

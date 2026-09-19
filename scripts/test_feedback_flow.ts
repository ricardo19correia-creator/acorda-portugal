import { checkEmailConfig, getFeedbackTypeLabel, sendFeedbackNotificationEmail } from '../lib/email-service';

async function main() {
  console.log('Testing email-service TypeScript exports:');
  console.log('- getFeedbackTypeLabel("erro"):', getFeedbackTypeLabel('erro'));
  console.log('- getFeedbackTypeLabel("ideia"):', getFeedbackTypeLabel('ideia'));
  console.log('- getFeedbackTypeLabel("outro"):', getFeedbackTypeLabel('outro'));

  const status = checkEmailConfig();
  console.log('- checkEmailConfig():', JSON.stringify(status, null, 2));

  // Test sendFeedbackNotificationEmail pre-flight
  try {
    await sendFeedbackNotificationEmail({
      feedbackId: 'test-123',
      userName: 'Test User',
      userEmail: 'test@example.com',
      userId: 'uid-123',
      type: 'erro',
      title: 'Teste de feedback',
      message: 'Esta e uma mensagem de teste para validar o servico de email.',
    });
    console.log('Email sent successfully');
  } catch (err: any) {
    console.log('Pre-flight/send catch behaving correctly:');
    console.log('Error message:', err.message);
  }

  console.log('✅ email-service test completed.');
}

main().catch(console.error);

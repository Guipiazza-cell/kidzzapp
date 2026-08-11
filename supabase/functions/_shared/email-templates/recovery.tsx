/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Crie uma nova senha ou um novo PIN no Kidzz</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Kidzz</Text>
        <Heading style={h1}>Vamos criar sua nova senha</Heading>
        <Text style={text}>
          Recebemos um pedido de recuperação de acesso da sua conta no{' '}
          {siteName}. Toque no botão abaixo para criar uma nova senha ou definir
          o PIN dos pais. Leva menos de um minuto.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Criar novo acesso
        </Button>
        <Text style={footer}>
          Se não foi você, pode ignorar este e-mail com tranquilidade. Nada será
          alterado na sua conta.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
}
const container = {
  padding: '32px 28px',
  maxWidth: '520px',
  backgroundColor: '#F7F6F2',
  borderRadius: '20px',
}
const brand = {
  fontSize: '13px',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  color: '#8FBF7F',
  fontWeight: 'bold' as const,
  margin: '0 0 18px',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#2E2E2E',
  margin: '0 0 18px',
}
const text = {
  fontSize: '16px',
  color: '#5A5A5A',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const button = {
  backgroundColor: '#8FBF7F',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  borderRadius: '20px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = { fontSize: '13px', color: '#8C8C8C', margin: '32px 0 0', lineHeight: '1.6' }

/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação Kidzz</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Kidzz</Text>
        <Heading style={h1}>Seu código de verificação</Heading>
        <Text style={text}>Use o código abaixo para confirmar que é você:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          O código expira em poucos minutos. Se não foi você, pode ignorar este
          e-mail com tranquilidade.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  letterSpacing: '6px',
  fontWeight: 'bold' as const,
  color: '#2E2E2E',
  margin: '0 0 28px',
}
const footer = { fontSize: '13px', color: '#8C8C8C', margin: '32px 0 0', lineHeight: '1.6' }

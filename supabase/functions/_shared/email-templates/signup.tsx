/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme seu e-mail e comece a usar o Kidzz</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Kidzz</Text>
        <Heading style={h1}>Bem-vindo ao Kidzz</Heading>
        <Text style={text}>
          Que bom ter você aqui. Falta só um passo para desligar a tela e ligar a
          infância com o seu filho.
        </Text>
        <Text style={text}>
          Toque no botão abaixo para confirmar seu e-mail:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmar meu e-mail
        </Button>
        <Text style={footer}>
          Se você não criou uma conta no{' '}
          <Link href={siteUrl} style={link}>
            {siteName}
          </Link>
          , pode ignorar este e-mail com tranquilidade.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
const link = { color: '#6FA65D', textDecoration: 'underline' }
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

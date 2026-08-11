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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Você foi convidado para o Kidzz</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Kidzz</Text>
        <Heading style={h1}>Você foi convidado</Heading>
        <Text style={text}>
          Alguém convidou você para fazer parte do{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Toque no botão abaixo para aceitar o convite e criar sua conta.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Aceitar convite
        </Button>
        <Text style={footer}>
          Se você não esperava este convite, pode ignorar este e-mail com
          tranquilidade.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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

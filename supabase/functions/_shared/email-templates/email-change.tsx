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

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail to read
  // "from OLD to NEW" instead of "from NEW to NEW".
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme a troca de e-mail da sua conta Kidzz</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Kidzz</Text>
        <Heading style={h1}>Confirme seu novo e-mail</Heading>
        <Text style={text}>
          Você pediu para trocar o e-mail da sua conta no {siteName} de{' '}
          <Link href={`mailto:${oldEmail}`} style={link}>
            {oldEmail}
          </Link>{' '}
          para{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Text style={text}>Toque no botão abaixo para confirmar a troca:</Text>
        <Button style={button} href={confirmationUrl}>
          Confirmar troca de e-mail
        </Button>
        <Text style={footer}>
          Se não foi você, proteja sua conta trocando a senha o quanto antes.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

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

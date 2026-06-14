// Wrapper legado — toda lógica/visual vive em PaywallScreen.
import PaywallScreen from "@/components/paywall/PaywallScreen";

interface ConversionScreenProps {
  childName: string;
  onSubscribe?: (plan: any) => void;
  loading?: boolean;
}

const ConversionScreen = ({ childName }: ConversionScreenProps) => {
  return <PaywallScreen childName={childName} />;
};

export default ConversionScreen;

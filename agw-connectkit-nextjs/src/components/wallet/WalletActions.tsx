import { LightningIcon, LogoutIcon } from "../icons/Icons";
import { Button } from "../ui/Button";

interface WalletActionsProps {
  onLogout: () => void;
  onSubmitTransaction: () => void;
  canSubmitTransaction: boolean;
}

export const WalletActions = ({
  onLogout,
  onSubmitTransaction,
  canSubmitTransaction,
}: WalletActionsProps) => (
  <div className="flex gap-2 w-full">
    <Button onClick={onLogout} variant="primary" className="flex-1">
      <LogoutIcon />
      Disconnect
    </Button>
    <Button
      onClick={onSubmitTransaction}
      variant="gradient"
      disabled={!canSubmitTransaction}
      className="flex-1 w-[140px]"
    >
      <LightningIcon className="flex-shrink-0" />
      <span className="w-full text-center">Submit tx</span>
    </Button>
  </div>
);

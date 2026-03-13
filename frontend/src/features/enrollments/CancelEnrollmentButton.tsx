import { Button } from "../../shared/ui/Button";
import { useCancelEnrollmentMutation } from "./hooks";

export function CancelEnrollmentButton({ enrollmentId }: { enrollmentId: number }) {
  const cancelMutation = useCancelEnrollmentMutation();

  return (
    <Button
      isLoading={cancelMutation.isPending}
      onClick={() => cancelMutation.mutate(enrollmentId)}
      size="sm"
      type="button"
      variant="secondary"
    >
      Cancel
    </Button>
  );
}

import { Card } from "./Card";
import { Page } from "./Page";

type FeaturePlaceholderProps = {
  description: string;
  title: string;
};

export function FeaturePlaceholder({ description, title }: FeaturePlaceholderProps) {
  return (
    <Page description={description} title={title}>
      <Card subtitle="This route is reserved and wired into the router." title="Next step">
        Move the data hooks, DTO types, and UI for this feature into its own module.
      </Card>
    </Page>
  );
}

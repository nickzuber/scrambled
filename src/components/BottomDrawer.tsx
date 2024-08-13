import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Drawer } from "vaul";
import { AppTheme } from "../constants/themes";

export interface BottomDrawerProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  renderContents: () => React.ReactNode;
}

export function BottomDrawer({
  title,
  children,
  open,
  onOpenChange,
  renderContents,
}: BottomDrawerProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(open) => (onOpenChange ? onOpenChange(open) : undefined)}
    >
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-zinc-100 flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0">
          <div
            className="p-4 bg-white rounded-t-[10px] flex-1"
            style={{
              maxHeight: "90vh",
              overflowY: "auto",
              paddingBottom: 32,
              background: theme.colors.primary,
            }}
          >
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
            {title ? <Title className="max-w-md mx-auto">{title}</Title> : null}
            <div className="max-w-md mx-auto">{renderContents()}</div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const Title = styled.h1`
  font-family: karnak-condensed;

  font-size: min(1.75em, 68px);
  line-height: 1.0714;
  margin: 4px 0 12px;
  max-width: 100%;
`;

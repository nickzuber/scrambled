import { Drawer } from "vaul";

export interface BottomDrawerProps {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  renderContents: () => React.ReactNode;
}

export function BottomDrawer({ children, onOpenChange, renderContents }: BottomDrawerProps) {
  return (
    <Drawer.Root onOpenChange={(open) => (onOpenChange ? onOpenChange(open) : undefined)}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-zinc-100 flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0">
          <div className="p-4 bg-white rounded-t-[10px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
            <div className="max-w-md mx-auto">{renderContents()}</div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

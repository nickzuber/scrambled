import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Drawer } from "vaul";
import { AppTheme } from "../constants/themes";

export interface BottomDrawerProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  renderContents: () => React.ReactNode;
  pessimisticallyAssumeOverflow?: boolean;
  scrollForMoreContentMessage?: React.ReactNode;
}

export function BottomDrawer({
  title,
  children,
  open,
  onOpenChange,
  renderContents,
  pessimisticallyAssumeOverflow,
  scrollForMoreContentMessage,
}: BottomDrawerProps) {
  const theme = useTheme() as AppTheme;
  const bottomView = useInView({ threshold: 0 });
  const bottomNodeRef = useRef<HTMLDivElement | null>(null);

  // If `pessimisticallyAssumeOverflow` is true, then we want to show the shadow
  // immediately before letting the drawer finish animating.
  const [shadowLock, setShadowLock] = useState(
    pessimisticallyAssumeOverflow ?? false
  );
  const shadowTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  function scrollToBottom() {
    if (bottomNodeRef.current) {
      bottomNodeRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(open) => {
        onOpenChange?.(open);
        if (open) {
          // I'm pretty sure the drawer animation is 0.5s
          const timing = pessimisticallyAssumeOverflow ? 0 : 500;
          shadowTimeoutRef.current = setTimeout(
            () => setShadowLock(true),
            timing
          );
        } else {
          if (shadowTimeoutRef.current) {
            clearTimeout(shadowTimeoutRef.current);
          }
          setShadowLock(false);
        }
      }}
    >
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-zinc-100 flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0">
          <div
            className="p-4 bg-white rounded-t-[10px] flex-1"
            style={{
              maxHeight: "90dvh",
              overflowY: "auto",
              paddingBottom: 32,
              background: theme.colors.primary,
            }}
          >
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
            <div className="max-w-md mx-auto">
              {title ? (
                <Title className="max-w-md mx-auto">{title}</Title>
              ) : null}
              {renderContents()}

              {scrollForMoreContentMessage ? (
                <ScrollDownCallout
                  onClick={scrollToBottom}
                  onTouchStart={scrollToBottom}
                  onTouchEnd={(e) => {
                    // This prevents `onClick` from being fired if `onTouchStart` was fired.
                    // https://stackoverflow.com/a/56970849/5055063
                    e.preventDefault();
                  }}
                  theme={theme}
                  show={shadowLock && !bottomView.inView}
                  className="float-centered"
                >
                  {scrollForMoreContentMessage}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    color={theme.colors.invertedText}
                  >
                    <path
                      d="M12 3L12 21M12 21L20.5 12.5M12 21L3.5 12.5"
                      stroke={theme.colors.invertedText}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </ScrollDownCallout>
              ) : null}

              <BottomShadow
                theme={theme}
                show={shadowLock && !bottomView.inView}
              />
              <div
                ref={(node) => {
                  bottomView.ref(node);
                  bottomNodeRef.current = node;
                }}
              />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const ScrollDownCallout = styled.div<{ theme: AppTheme; show?: boolean }>`
  z-index: 6;
  position: absolute;
  user-select: none;

  bottom: 24px;

  font-size: 1em;
  font-weight: 600;
  display: flex;
  gap: 8px;
  text-align: center;
  justify-content: center;
  align-items: center;
  border-radius: 32px;

  padding: 6px 18px;
  text-transform: none;
  white-space: nowrap;

  color: ${(p) => p.theme.colors.invertedText};
  border: 1px solid ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.text};
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;

  left: 50%;
  transform: translateX(-50%);

  transition: opacity 200ms ease-in-out;
  opacity: ${(p) => (p.show ? 1 : 0)};

  &:active {
    opacity: 0.75;
  }
`;

const BottomShadow = styled.div<{ theme: AppTheme; show: boolean }>`
  z-index: 2;
  position: absolute;
  pointer-events: none;

  bottom: 0;
  left: 0;
  right: 0;

  transition: opacity 200ms ease-in-out;
  opacity: ${(p) => (p.show ? 1 : 0)};

  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    ${(p) => p.theme.colors.primary}cc 56.65%,
    ${(p) => p.theme.colors.primary} 100%
  );
  height: 100px;
`;

const Title = styled.h1`
  font-family: karnak-condensed;

  font-size: min(1.75em, 68px);
  line-height: 1.0714;
  margin: 4px 0 12px;
  max-width: 100%;
`;

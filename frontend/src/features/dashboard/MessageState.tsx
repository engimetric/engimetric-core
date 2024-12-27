export const MessageState = (props: {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  button: React.ReactNode;
}) => (
  <div className="flex h-full flex-col items-center justify-center rounded-md bg-card">
    <div className="size-16 rounded-full bg-muted p-3 [&_svg]:stroke-muted-foreground [&_svg]:stroke-2">
      {props.icon}
    </div>

    <div className="mb-24 mt-3 text-center">
      <div className="text-xl font-semibold">{props.title}</div>
      <div className="mt-1 text-sm font-medium text-muted-foreground">
        {props.description}
      </div>

      <div className="mt-5">{props.button}</div>
    </div>
  </div>
);

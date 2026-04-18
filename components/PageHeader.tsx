type Props = {
  title: string;
  hideLine?: boolean;
};

export function PageHeader({ title, hideLine = false }: Props) {
  return (
    <header
      className={`sticky top-0 z-10 shrink-0 bg-background/80 backdrop-blur-sm p-4 text-center h-20 flex items-center justify-center ${hideLine ? '' : 'border-b'}`}
    >
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}

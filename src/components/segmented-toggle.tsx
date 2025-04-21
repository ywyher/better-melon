function ToggleItem({ 
  option, 
  onSelect, 
  isSelected 
}: {
  option: string;
  onSelect: (value: string) => void;
  isSelected: boolean;
}) {
  return (
    <div
      className={`
        cursor-pointer px-4 py-2 font-medium transition-colors
        capitalize w-full text-center text-sm
        ${isSelected 
          ? "bg-secondary text-secondary-foreground" 
          : "bg-transparent hover:bg-secondary/20 active:bg-secondary/30"}
        first:rounded-l-md last:rounded-r-md
        border-r border-secondary last:border-r-0
      `}
      onClick={() => onSelect(option)}
    >
      {option}
    </div>
  )
}

export default function SegmentedToggle<T extends string>({ 
  options,
  value,
  onValueChange,
  disabled = false
}: {
  options: T[];
  value: T;
  onValueChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`
      flex flex-row border border-secondary rounded-md overflow-hidden shadow-sm w-full max-w-xl
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}>
      {options.map((option) => (
        <ToggleItem
          key={option}
          option={option}
          isSelected={option === value}
          onSelect={(selectedValue) => {
            if (!disabled) {
              onValueChange(selectedValue as T);
            }
          }}
        />
      ))}
    </div>
  )
}
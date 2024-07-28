import { FC } from 'react';
import { Icon, IconName } from './icon.tsx';

interface ButtonProps {
  label?: string;
  title?: string;
  icon?: IconName;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Button: FC<ButtonProps> = ({
  label,
  title,
  icon,
  onClick,
  active = false,
  className,
}) => {
  return (
    <>
      <button
        className={
          'bg-transparent text-blue-700 font-semibold py-2 px-2 border border-blue-500 rounded w-10 h-10 flex flex-row justify-center items-center hover:bg-blue-500 hover:text-white hover:border-transparent  data-[active=true]:bg-blue-500 data-[active=true]:text-white data-[active=true]:border-transparent' +
          (className ? ' ' + className : '')
        }
        data-active={active}
        onClick={onClick}
        title={title}
      >
        {icon && <Icon name={icon} />}
        {label && <span>{label}</span>}
      </button>
    </>
  );
};

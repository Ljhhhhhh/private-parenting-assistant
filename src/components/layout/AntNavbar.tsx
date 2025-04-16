import React from 'react';
import { NavBar, SafeArea } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  title?: string;
  back?: boolean;
  right?: React.ReactNode;
  onBack?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  title = '育儿助手',
  back = false,
  right,
  onBack,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <NavBar
        className="border-b border-gray-200"
        back={back ? '返回' : undefined}
        onBack={handleBack}
        right={right}
      >
        {title}
      </NavBar>
      <SafeArea position="top" />
    </>
  );
};

export default Navbar;

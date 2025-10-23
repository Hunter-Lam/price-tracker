import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { UNITS } from '../constants';

interface UnitSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  allowedUnits?: readonly string[];
  allowClear?: boolean;
  showSearch?: boolean;
}

export const UnitSelect: React.FC<UnitSelectProps> = ({
  value,
  onChange,
  placeholder,
  allowedUnits,
  allowClear = true,
  showSearch = true,
}) => {
  const { t } = useTranslation();

  // Filter units if allowedUnits is provided
  const unitsToShow = allowedUnits || UNITS;

  const options = unitsToShow.map(unit => ({
    label: t(`constants.units.${unit}`, { defaultValue: unit }),
    value: unit
  }));

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch={showSearch}
      options={options}
    />
  );
};

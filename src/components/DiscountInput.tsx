import React from "react";
import { InputNumber, Space } from "antd";
import { useTranslation } from 'react-i18next';

interface DiscountInputProps {
  format: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
}

const DiscountInput: React.FC<DiscountInputProps> = ({ format, value, onChange }) => {
  const { t } = useTranslation();
  
  const renderDiscountFormat = () => {
    switch (format) {
      case "折扣":
        return (
          <Space.Compact size="small">
            <InputNumber 
              min={0} 
              max={10} 
              precision={1} 
              placeholder={t('discountInput.discount')} 
              addonAfter={t('discountInput.discountUnit')}
              value={typeof value === 'number' ? value : undefined}
              onChange={(val) => onChange?.(val || 0)}
            />
          </Space.Compact>
        );
      
      case "滿折":
        // Parse value like "满800元9.5折" into two parts
        let minAmountForDiscount = 0;
        let discountRateForAmount = 0;
        if (typeof value === 'string' && value.includes('满') && value.includes('元') && value.includes('折')) {
          const match = value.match(/满(\d+)元([\d.]+)折/);
          if (match) {
            minAmountForDiscount = parseInt(match[1]);
            discountRateForAmount = parseFloat(match[2]);
          }
        }

        return (
          <Space.Compact size="small">
            <InputNumber
              min={0}
              precision={0}
              placeholder={t('discountInput.amount')}
              addonBefore={t('discountInput.min')}
              addonAfter={t('discountInput.currency')}
              value={minAmountForDiscount || undefined}
              onChange={(val1) => {
                const newMinAmount = val1 || 0;
                const newValue = `满${newMinAmount}元${discountRateForAmount}折`;
                onChange?.(newValue);
              }}
            />
            <InputNumber
              min={0}
              max={10}
              precision={1}
              placeholder={t('discountInput.discount')}
              addonAfter={t('discountInput.discountUnit')}
              value={discountRateForAmount || undefined}
              onChange={(val2) => {
                const newDiscountRate = val2 || 0;
                const newValue = `满${minAmountForDiscount}元${newDiscountRate}折`;
                onChange?.(newValue);
              }}
            />
          </Space.Compact>
        );
      
      case "滿件折":
        // Parse value like "满3件9.5折" into two parts
        let minQuantity = 0;
        let discountRate = 0;
        if (typeof value === 'string' && value.includes('满') && value.includes('件') && value.includes('折')) {
          const match = value.match(/满(\d+)件([\d.]+)折/);
          if (match) {
            minQuantity = parseInt(match[1]);
            discountRate = parseFloat(match[2]);
          }
        }
        
        return (
          <Space.Compact size="small">
            <InputNumber 
              min={0}
              precision={0} 
              placeholder={t('discountInput.quantity')} 
              addonBefore={t('discountInput.min')}
              addonAfter={t('discountInput.quantityUnit')}
              value={minQuantity || undefined}
              onChange={(val1) => {
                const newMinQuantity = val1 || 0;
                const newValue = `满${newMinQuantity}件${discountRate}折`;
                onChange?.(newValue);
              }}
            />
            <InputNumber 
              min={0}
              max={10} 
              precision={1} 
              placeholder={t('discountInput.discount')} 
              addonAfter={t('discountInput.discountUnit')}
              value={discountRate || undefined}
              onChange={(val2) => {
                const newDiscountRate = val2 || 0;
                const newValue = `满${minQuantity}件${newDiscountRate}折`;
                onChange?.(newValue);
              }}
            />
          </Space.Compact>
        );
      
      case "每滿減":
        // Parse value like "每满68减20" into two parts (amount-based only)
        let everyAmount = 0;
        let everyAmountReduction = 0;

        if (typeof value === 'string' && value.includes('每满') && value.includes('减') && !value.includes('件')) {
          const match = value.match(/每满(\d+)减(\d+)/);
          if (match) {
            everyAmount = parseInt(match[1]);
            everyAmountReduction = parseInt(match[2]);
          }
        }

        return (
          <Space.Compact size="small">
            <InputNumber
              min={0}
              precision={0}
              placeholder={t('discountInput.amount')}
              addonBefore={t('discountInput.everyMin')}
              addonAfter={t('discountInput.currency')}
              value={everyAmount || undefined}
              onChange={(val1) => {
                const newEveryAmount = val1 || 0;
                const newValue = `每满${newEveryAmount}减${everyAmountReduction}`;
                onChange?.(newValue);
              }}
            />
            <InputNumber
              min={0}
              precision={0}
              placeholder={t('discountInput.reduction')}
              addonBefore={t('discountInput.reduce')}
              addonAfter={t('discountInput.currency')}
              value={everyAmountReduction || undefined}
              onChange={(val2) => {
                const newEveryReduction = val2 || 0;
                const newValue = `每满${everyAmount}减${newEveryReduction}`;
                onChange?.(newValue);
              }}
            />
          </Space.Compact>
        );

      case "滿件減":
        // Parse value like "满1件减2" into two parts
        let minQuantityForReduction = 0;
        let quantityReductionAmount = 0;
        if (typeof value === 'string' && value.includes('满') && value.includes('件减')) {
          const match = value.match(/满(\d+)件减(\d+)/);
          if (match) {
            minQuantityForReduction = parseInt(match[1]);
            quantityReductionAmount = parseInt(match[2]);
          }
        }

        return (
          <Space.Compact size="small">
            <InputNumber
              min={0}
              precision={0}
              placeholder={t('discountInput.quantity')}
              addonBefore={t('discountInput.min')}
              addonAfter={t('discountInput.quantityUnit')}
              value={minQuantityForReduction || undefined}
              onChange={(val1) => {
                const newMinQuantity = val1 || 0;
                const newValue = `满${newMinQuantity}件减${quantityReductionAmount}`;
                onChange?.(newValue);
              }}
            />
            <InputNumber
              min={0}
              precision={0}
              placeholder={t('discountInput.reduction')}
              addonBefore={t('discountInput.reduce')}
              addonAfter={t('discountInput.currency')}
              value={quantityReductionAmount || undefined}
              onChange={(val2) => {
                const newReductionAmount = val2 || 0;
                const newValue = `满${minQuantityForReduction}件减${newReductionAmount}`;
                onChange?.(newValue);
              }}
            />
          </Space.Compact>
        );

      case "滿減":
        // Parse value like "满800减65" into two parts
        let minAmount = 0;
        let reductionAmount = 0;
        if (typeof value === 'string' && value.includes('满') && value.includes('减')) {
          const match = value.match(/满(\d+)减(\d+)/);
          if (match) {
            minAmount = parseInt(match[1]);
            reductionAmount = parseInt(match[2]);
          }
        }

        return (
          <Space.Compact size="small">
            <InputNumber
              min={0}
              precision={0}
              placeholder={t('discountInput.amount')}
              addonBefore={t('discountInput.min')}
              addonAfter={t('discountInput.currency')}
              value={minAmount || undefined}
              onChange={(val1) => {
                const newMinAmount = val1 || 0;
                const newValue = `满${newMinAmount}减${reductionAmount}`;
                onChange?.(newValue);
              }}
            />
            <InputNumber
              min={0}
              precision={0}
              placeholder={t('discountInput.reduction')}
              addonBefore={t('discountInput.reduce')}
              addonAfter={t('discountInput.currency')}
              value={reductionAmount || undefined}
              onChange={(val2) => {
                const newReductionAmount = val2 || 0;
                const newValue = `满${minAmount}减${newReductionAmount}`;
                onChange?.(newValue);
              }}
            />
          </Space.Compact>
        );
      
      case "首購":
      case "立減":
        return (
          <Space.Compact size="small">
            <InputNumber
              min={0}
              precision={2}
              placeholder={t('discountInput.amount')}
              addonAfter={t('discountInput.currency')}
              value={typeof value === 'number' ? value : undefined}
              onChange={(val) => onChange?.(val || 0)}
            />
          </Space.Compact>
        );

      case "限購":
        // Parse value like "3件-10" (quantity-discount per piece)
        let limitQuantity = 1;
        let limitDiscountPerPiece = 0;

        if (typeof value === 'string' && value.includes('件-')) {
          const match = value.match(/(\d+)件-([\d.]+)/);
          if (match) {
            limitQuantity = parseInt(match[1]);
            limitDiscountPerPiece = parseFloat(match[2]);
          }
        } else if (typeof value === 'number') {
          // If only a number is provided, treat it as discount amount
          limitDiscountPerPiece = value;
        }

        return (
          <Space.Compact size="small">
            <InputNumber
              min={1}
              precision={0}
              placeholder={t('discountInput.quantity')}
              addonAfter={t('discountInput.quantityUnit')}
              value={limitQuantity}
              onChange={(val) => {
                const newQty = val || 1;
                const newValue = `${newQty}件-${limitDiscountPerPiece}`;
                onChange?.(newValue);
              }}
            />
            <InputNumber
              min={0}
              precision={2}
              placeholder={t('discountInput.reduction')}
              addonBefore={t('discountInput.reduce')}
              addonAfter={t('discountInput.currency')}
              value={limitDiscountPerPiece}
              onChange={(val) => {
                const newDiscount = val || 0;
                const newValue = `${limitQuantity}件-${newDiscount}`;
                onChange?.(newValue);
              }}
            />
          </Space.Compact>
        );

      default:
        return null;
    }
  };

  return renderDiscountFormat();
};

export default DiscountInput;
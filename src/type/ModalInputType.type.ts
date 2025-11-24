
import { FormFields } from '@/Type/EditModalType.type';

export interface ModalInputType {
    placeholder: string;
    id: string;
    value: string;
    inputType: 'text' | 'number' | 'textarea' | 'hidden' | 'email' | 'password';
    onUpdateInputs: (id: string, value: string) => void;
    fieldKey: string;
    fields: FormFields;
}
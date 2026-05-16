import { Input } from 'antd';
import type { TextAreaProps } from 'antd/es/input';

const { TextArea: AntTextArea } = Input;

export function Textarea(props: TextAreaProps) {
  return <AntTextArea {...props} />;
}

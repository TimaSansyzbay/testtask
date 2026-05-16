import { Spin } from 'antd';

type LoaderProps = {
  tip?: string;
};

export function Loader({ tip = 'Loading...' }: LoaderProps) {
  return <Spin tip={tip} />;
}

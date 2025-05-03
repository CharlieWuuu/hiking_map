import { Link } from 'react-router-dom';

type Props = {
    url: string;
};
export default function GoBack({ url }: Props) {
    return (
        <Link to={url} className="GoBack">
            <button>返回</button>
        </Link>
    );
}

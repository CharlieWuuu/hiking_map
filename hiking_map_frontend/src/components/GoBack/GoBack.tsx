import { Link, useParams } from 'react-router-dom';
import { useOwner } from '../../hooks/useOwner';
import backImg from '../../assets/images/Table_Pagination.svg';
type Owner = {
    name: string;
    name_zh: string;
    id: string;
    uuid: string;
    avatar: string;
    level: string;
    description: string;
    type: string;
};
type Props = {
    url: string;
};
export default function GoBack({ url }: Props) {
    const { user } = useOwner();
    const { type } = useParams();

    return (
        <Link to={url} className="GoBack">
            <button style={{ gap: '0.5rem' }}>
                <img src={backImg} alt="回上頁" style={{ transform: 'rotate(180deg)' }} />
                {user && <img src={user.avatar} alt="頭像" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />}
                {user && <span style={{ fontSize: '1.2rem' }}>{type === 'user' ? user.name : user.name_zh}</span>}
            </button>
        </Link>
    );
}

import { Link, useParams } from 'react-router-dom';
import { useOwnerDetail } from '../../hooks/useOwnerDetail';
import backImg from '../../assets/images/Table_Pagination.svg';

type Props = {
    url: string;
};
export default function GoBack({ url }: Props) {
    const { name, type } = useParams<{ name: string; type: string }>();
    const { owner } = useOwnerDetail({
        name: name!,
        type: type!,
    });

    return (
        <Link to={url} className="GoBack">
            <button style={{ gap: '0.2rem', padding: '0.4rem 1rem', borderRadius: '4rem' }}>
                <img src={backImg} alt="回上頁" style={{ transform: 'rotate(180deg)' }} />
                {owner && <img src={owner.avatar} alt="頭像" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                {owner && <span style={{ fontSize: '1.2rem' }}>{type === 'user' ? owner.name : owner.name_zh}</span>}
            </button>
        </Link>
    );
}

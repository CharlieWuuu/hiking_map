import SearchUser from '../components/Search/SearchUser';
import { Owner } from '../types/owner';

type Props = {
    ownerList: Owner[];
};

export default function Search_Owner({ ownerList }: Props) {
    return (
        <div style={{ minHeight: 'calc(100vh - var(--navbar_outer_height) - 300px)' }}>
            <SearchUser ownerList={ownerList} />
        </div>
    );
}

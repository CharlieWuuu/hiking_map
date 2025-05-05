import SearchUser from '../components/Search/SearchUser';

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
    ownerList: Owner[];
};
export default function Search_Owner({ ownerList }: Props) {
    return (
        <div style={{ minHeight: 'calc(100vh - var(--navbar_outer_height) - 300px)' }}>
            <SearchUser ownerList={ownerList} />
        </div>
    );
}

// import styles from '../../styles/pages/Owner_View.module.scss';

// import { useParams } from 'react-router-dom';

// import Hundred from '../../components/common/Chart/Hundred';

// function OwnerViewAchievement() {
//     const { type } = useParams<{ name: string; type: string }>();
// 	const isUser = type === 'user';
// 	    const { totalDistance, hundredCount, smallHundredCount, hundredTrailCount } = trails.features.reduce(
//         (acc, feature) => {
//             const props = feature.properties || {};
//             acc.totalDistance += props.length || 0;
//             if (props.hundred_id) acc.hundredCount += 1;
//             if (props.small_hundred_id) acc.smallHundredCount += 1;
//             if (props.hundred_trail_id) acc.hundredTrailCount += 1;
//             return acc;
//         },
//         { totalDistance: 0, hundredCount: 0, smallHundredCount: 0, hundredTrailCount: 0 },
//     );
//     return (
//         <section className={styles.Owner_Achievement}>
//             <h2>成就</h2>
//             <div className={styles.Owner_Achievement_Content}>
//                 {isUser && (
//                     <div>
//                         <span>百岳</span>
//                         <Hundred value={hundredCount} />
//                     </div>
//                 )}
//                 {isUser && (
//                     <div>
//                         <span>小百岳</span>
//                         <Hundred value={smallHundredCount} />
//                     </div>
//                 )}
//                 {isUser && (
//                     <div>
//                         <span>百大必訪步道</span>
//                         <Hundred value={hundredTrailCount} />
//                     </div>
//                 )}
//             </div>
//         </section>
//     );
// }

// export default OwnerViewAchievement;

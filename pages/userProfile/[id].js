import { useRouter } from "next/router";
import Profil from "../../components/userProfile/UserProfile";

export default function Profile() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return <p>Loading...</p>;
  }

  return <Profil userId={id} />;
}

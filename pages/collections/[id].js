import { useRouter } from "next/router";
import CollectionPage from "../../components/Collection/CollectionPage";
import Element from "../../components/Collection/Element";

export default function CollectionPageWrapper() {
  // Utilisation du hook useRouter pour obtenir l'ID depuis l'URL
  const router = useRouter();
  const { id } = router.query; // Récupère l'ID de la collection depuis l'URL

  if (!id) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <CollectionPage collectionId={id} />
    </>
  );
}

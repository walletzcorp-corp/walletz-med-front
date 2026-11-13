import { Organization } from "../../../models/organization";
import UnitsPanel from "./UnitsPanel";

interface Props {
    organization: Organization;
}

function OrganizationDetail({organization }: Props){
    return(
        <div className="org-detail">
        <UnitsPanel
            organizationId={organization.id}
            canCreate={organization.status === "ACTIVE"}
      />
        </div>
    )
}

export default OrganizationDetail;
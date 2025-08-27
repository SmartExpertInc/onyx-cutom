import { AdminPageTitle } from "@/components/admin/Title";
import Text from "@/components/ui/text";
import { SettingsIcon } from "@/components/icons/icons";

export default async function Page() {
    return (
        <div className="mx-auto container">
            <AdminPageTitle
                title="Workspace"
                icon={<SettingsIcon size={32} className="my-auto" />}
            />

            <Text className="mb-8">
                Welcome to your workspace. Build, manage, and collaborate on your
                content here.
            </Text>

        </div>
    );
}



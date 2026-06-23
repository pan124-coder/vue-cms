import type { Directive, DirectiveBinding } from 'vue';
import {useUserStore} from '@/stores/user.ts';

export const permissionDirective: Directive = {
    mounted(el, binding) {
        const {value} = binding;
        const userStore = useUserStore();
        const permissions = userStore.permissions;

        if (value && value.length > 0) {
            const hasPermission = value.some((perm: string) => permissions.includes(perm));
            
            if (!hasPermission) {
                el.disabled = true;
                el.classList.add('permission-disabled');
            }
        }
    },
    updated(el, binding) {
        const {value} = binding;
        const userStore = useUserStore();
        const permissions = userStore.permissions;

        if (value && value.length > 0) {
            const hasPermission = value.some((perm: string) => permissions.includes(perm));
            
            if (!hasPermission) {
                el.disabled = true;
                el.classList.add('permission-disabled');
            } else {
                el.disabled = false;
                el.classList.remove('permission-disabled');
            }
        }
    }
};

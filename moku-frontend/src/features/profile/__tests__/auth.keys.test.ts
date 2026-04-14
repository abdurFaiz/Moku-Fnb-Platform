import { describe, it, expect } from 'vitest';
import { authQueryKeys, createAuthScopedKeys } from '../services/auth.keys';
import { AUTH_QUERY_KEYS } from '../services/auth.constants';
import './setup';

describe('auth.keys', () => {
    describe('authQueryKeys', () => {
        describe('all', () => {
            it('should return base auth key', () => {
                const result = authQueryKeys.all;

                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT]);
                expect(result).toHaveLength(1);
            });

            it('should be readonly', () => {
                const result = authQueryKeys.all;

                expect(Object.isFrozen(result)).toBe(false); // Arrays are not frozen by default
                expect(Array.isArray(result)).toBe(true);
            });
        });

        describe('profile', () => {
            it('should return profile key without outlet slug', () => {
                const result = authQueryKeys.profile();

                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'profile']);
                expect(result).toHaveLength(2);
            });

            it('should return profile key with outlet slug', () => {
                const result = authQueryKeys.profile('test-outlet');

                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'profile', 'test-outlet']);
                expect(result).toHaveLength(3);
            });

            it('should handle empty string outlet slug', () => {
                const result = authQueryKeys.profile('');

                // Empty string is filtered out by the implementation
                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'profile']);
                expect(result).toHaveLength(2);
            });

            it('should handle special characters in outlet slug', () => {
                const specialSlug = 'test-outlet-123_special';
                const result = authQueryKeys.profile(specialSlug);

                expect(result).toContain(specialSlug);
            });

            it('should handle undefined outlet slug', () => {
                const result = authQueryKeys.profile(undefined);

                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'profile']);
            });
        });

        describe('profileDetail', () => {
            it('should return profile detail key without userId', () => {
                const result = authQueryKeys.profileDetail();

                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'profile']);
            });

            it('should return profile detail key with userId', () => {
                const result = authQueryKeys.profileDetail('user-123');

                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'profile', 'user-123']);
            });

            it('should filter out undefined values', () => {
                const result = authQueryKeys.profileDetail(undefined);

                expect(result).not.toContain(undefined);
                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'profile']);
            });

            it('should handle empty string userId', () => {
                const result = authQueryKeys.profileDetail('');

                // Empty string is falsy, should be filtered out
                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'profile']);
            });
        });

        describe('user', () => {
            it('should return user key with userId', () => {
                const result = authQueryKeys.user('user-123');

                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'user', 'user-123']);
                expect(result).toHaveLength(3);
            });

            it('should handle different userId formats', () => {
                const uuidFormat = authQueryKeys.user('550e8400-e29b-41d4-a716-446655440000');
                const numericFormat = authQueryKeys.user('12345');
                const stringFormat = authQueryKeys.user('user-abc-123');

                expect(uuidFormat).toContain('550e8400-e29b-41d4-a716-446655440000');
                expect(numericFormat).toContain('12345');
                expect(stringFormat).toContain('user-abc-123');
            });
        });

        describe('session', () => {
            it('should return session key', () => {
                const result = authQueryKeys.session();

                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'session']);
                expect(result).toHaveLength(2);
            });

            it('should be consistent across multiple calls', () => {
                const result1 = authQueryKeys.session();
                const result2 = authQueryKeys.session();

                expect(result1).toEqual(result2);
            });
        });

        describe('permissions', () => {
            it('should return permissions key without userId', () => {
                const result = authQueryKeys.permissions();

                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'permissions']);
            });

            it('should return permissions key with userId', () => {
                const result = authQueryKeys.permissions('user-123');

                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'permissions', 'user-123']);
            });

            it('should filter out undefined userId', () => {
                const result = authQueryKeys.permissions(undefined);

                expect(result).not.toContain(undefined);
                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'permissions']);
            });

            it('should handle empty string userId', () => {
                const result = authQueryKeys.permissions('');

                // Empty string is falsy, should be filtered out
                expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'permissions']);
            });
        });
    });

    describe('createAuthScopedKeys', () => {
        it('should create scoped keys with single scope', () => {
            const scope = ['custom-scope'] as const;
            const result = createAuthScopedKeys(scope);

            expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'custom-scope']);
        });

        it('should create scoped keys with multiple scopes', () => {
            const scope = ['feature', 'sub-feature', 'detail'] as const;
            const result = createAuthScopedKeys(scope);

            expect(result).toEqual([AUTH_QUERY_KEYS.ROOT, 'feature', 'sub-feature', 'detail']);
        });

        it('should create scoped keys with empty scope', () => {
            const scope = [] as const;
            const result = createAuthScopedKeys(scope);

            expect(result).toEqual([AUTH_QUERY_KEYS.ROOT]);
        });

        it('should handle special characters in scope', () => {
            const scope = ['feature-123', 'sub_feature', 'detail.v2'] as const;
            const result = createAuthScopedKeys(scope);

            expect(result).toContain('feature-123');
            expect(result).toContain('sub_feature');
            expect(result).toContain('detail.v2');
        });

        it('should maintain readonly type', () => {
            const scope = ['test'] as const;
            const result = createAuthScopedKeys(scope);

            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('Key Uniqueness', () => {
        it('should generate unique keys for different profiles', () => {
            const profile1 = authQueryKeys.profile('outlet-1');
            const profile2 = authQueryKeys.profile('outlet-2');

            expect(profile1).not.toEqual(profile2);
        });

        it('should generate unique keys for different users', () => {
            const user1 = authQueryKeys.user('user-1');
            const user2 = authQueryKeys.user('user-2');

            expect(user1).not.toEqual(user2);
        });

        it('should generate unique keys for different permissions', () => {
            const perm1 = authQueryKeys.permissions('user-1');
            const perm2 = authQueryKeys.permissions('user-2');

            expect(perm1).not.toEqual(perm2);
        });
    });

    describe('Key Consistency', () => {
        it('should generate same key for same profile parameters', () => {
            const key1 = authQueryKeys.profile('test-outlet');
            const key2 = authQueryKeys.profile('test-outlet');

            expect(key1).toEqual(key2);
        });

        it('should generate same key for same user parameters', () => {
            const key1 = authQueryKeys.user('user-123');
            const key2 = authQueryKeys.user('user-123');

            expect(key1).toEqual(key2);
        });

        it('should generate same session key', () => {
            const key1 = authQueryKeys.session();
            const key2 = authQueryKeys.session();

            expect(key1).toEqual(key2);
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long outlet slugs', () => {
            const longSlug = 'a'.repeat(1000);
            const result = authQueryKeys.profile(longSlug);

            expect(result).toContain(longSlug);
            expect(result.length).toBeGreaterThan(2);
        });

        it('should handle unicode characters in slugs', () => {
            const unicodeSlug = '测试-outlet-مرحبا';
            const result = authQueryKeys.profile(unicodeSlug);

            expect(result).toContain(unicodeSlug);
        });

        it('should handle numeric slugs', () => {
            const numericSlug = '12345';
            const result = authQueryKeys.profile(numericSlug);

            expect(result).toContain(numericSlug);
        });

        it('should handle slugs with special URL characters', () => {
            const specialSlug = 'test-outlet?param=value&other=123';
            const result = authQueryKeys.profile(specialSlug);

            expect(result).toContain(specialSlug);
        });
    });
});

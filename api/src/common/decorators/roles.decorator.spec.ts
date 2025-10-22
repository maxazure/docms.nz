import { Roles } from './roles.decorator';
import { SetMetadata } from '@nestjs/common';

describe('Roles Decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set roles metadata with single role', () => {
    jest.spyOn(SetMetadata, 'setMetadata').mockImplementation(() => {
      return () => {};
    });

    // Simulate decorator usage
    const decorator = Roles('OWNER');
    const mockTarget = class TestController {};
    const mockPropertyKey = 'testMethod';

    decorator(mockTarget, mockPropertyKey, undefined);

    expect(SetMetadata.setMetadata).toHaveBeenCalledWith(
      'roles',
      ['OWNER'],
      mockTarget,
      mockPropertyKey
    );
  });

  it('should set roles metadata with multiple roles', () => {
    jest.spyOn(SetMetadata, 'setMetadata').mockImplementation(() => {
      return () => {};
    });

    const decorator = Roles('OWNER', 'ADMIN', 'EDITOR');
    const mockTarget = class TestController {};
    const mockPropertyKey = 'testMethod';

    decorator(mockTarget, mockPropertyKey, undefined);

    expect(SetMetadata.setMetadata).toHaveBeenCalledWith(
      'roles',
      ['OWNER', 'ADMIN', 'EDITOR'],
      mockTarget,
      mockPropertyKey
    );
  });

  it('should handle empty roles array', () => {
    jest.spyOn(SetMetadata, 'setMetadata').mockImplementation(() => {
      return () => {};
    });

    const decorator = Roles();
    const mockTarget = class TestController {};
    const mockPropertyKey = 'testMethod';

    decorator(mockTarget, mockPropertyKey, undefined);

    expect(SetMetadata.setMetadata).toHaveBeenCalledWith(
      'roles',
      [],
      mockTarget,
      mockPropertyKey
    );
  });

  it('should work with UserRole enum values', () => {
    jest.spyOn(SetMetadata, 'setMetadata').mockImplementation(() => {
      return () => {};
    });

    const decorator = Roles('VIEWER', 'EDITOR');
    const mockTarget = class TestController {};
    const mockPropertyKey = 'testMethod';

    decorator(mockTarget, mockPropertyKey, undefined);

    expect(SetMetadata.setMetadata).toHaveBeenCalledWith(
      'roles',
      ['VIEWER', 'EDITOR'],
      mockTarget,
      mockPropertyKey
    );
  });
});
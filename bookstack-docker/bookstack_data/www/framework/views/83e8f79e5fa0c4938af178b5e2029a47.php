
<div component="add-remove-rows"
       option:add-remove-rows:remove-selector="button.text-neg"
       option:add-remove-rows:row-selector=".flex-container-row"
        class="flex-container-column gap-xs">
    <?php $__currentLoopData = array_merge($currentList, ['']); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $term): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
        <div <?php if(empty($term)): ?> refs="add-remove-rows@model" <?php endif; ?>
            class="<?php echo e($term ? '' : 'hidden'); ?> flex-container-row items-center gap-x-xs">
            <div>
                <input class="exact-input outline" type="text" name="<?php echo e($type); ?>[]" value="<?php echo e($term); ?>">
            </div>
            <div>
                <button type="button" class="text-neg text-button icon-button p-xs"><?php echo (new \BookStack\Util\SvgIcon('close'))->toHtml(); ?></button>
            </div>
        </div>
    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    <div class="flex py-xs">
        <button refs="add-remove-rows@add" type="button" class="text-button">
            <?php echo (new \BookStack\Util\SvgIcon('add-circle'))->toHtml(); ?><?php echo e(trans('common.add')); ?>

        </button>
    </div>
</div><?php /**PATH /app/www/resources/views/search/parts/term-list.blade.php ENDPATH**/ ?>